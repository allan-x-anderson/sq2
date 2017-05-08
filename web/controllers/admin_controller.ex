defmodule Sq2.AdminController do
  use Sq2.Web, :controller

  alias Sq2.{Repo, Game, Player, Board, RoleAssigner}

  def index(conn, _params) do
    games = Repo.all(Game)
    boards = Repo.all(Board)
             |> Repo.preload([:roles])
    render(conn, "index.html", games: games, boards: boards)
  end


  def supervise_game(conn, %{"game_id" => id}) do
    game = Repo.one from game in Game,
      where: game.id == ^id,
      left_join: players in assoc(game, :players),
      left_join: boards in assoc(game, :boards),
      left_join: board_players in assoc(boards, :players),
      left_join: roles in assoc(boards, :roles),
      preload: [boards: {boards, roles: roles, players: board_players}, players: players]

    game_json = Poison.encode! game
    render conn, "supervise_game.html", game: game
  end

  def trim_disconnected_players(conn, %{"board_id" => board_id}) do
    # board = Repo.get(Board, params["board_id"]) |> preload([:players])
    board = Repo.one from board in Board,
      where: board.id == ^board_id,
      left_join: players in assoc(board, :players),
      preload: [players: players]

    board_topic = "board:" <> Integer.to_string(board.id)
    current_presences =
      Sq2.Presence.list(board_topic)
    connected_ids = Map.keys(current_presences) |> Enum.map(&(String.to_integer &1))
    player_ids = Enum.map(board.players, fn(p)-> p.id end)
    to_remove = player_ids -- connected_ids

    from(p in Player, where: p.id in ^to_remove) |> Repo.delete_all
    redirect conn, to: "/admin/supervise_game/#{board.game_id}"
  end

  def board_params_from_repo(board) do
      %{ "id" => board.id, "game_id"=> board.game_id, "name" => board.name, "type" => board.type, "is_active" => board.is_active }
  end

  def check_goals(players, board_type, matches) do
    case board_type do
      "fake_news" ->
        players_to_update =
          Enum.filter(players, fn(p)-> p.role.name == "breibarter" end)
          |> Enum.each(fn(p)->
            changeset = Player.changeset(p, %{achieved_goals_for: Enum.uniq(p.achieved_goals_for ++ ["breibarter"])})
            Repo.update(changeset)
          end)
        IO.puts "OLALSLFLFASFADLFALASFLASFLFAFASLFASDLFASD"
        IO.inspect matches
      "democracy" ->
        match_counts =
          matches
          |> Enum.map(fn(match)-> match["tiles"] end)
          |> List.flatten
          |> Enum.reduce(%{}, fn(tag, acc) -> Map.update(acc, tag, 1, &(&1 + 1)) end)
        {max_key, max_val} = Enum.max_by(match_counts, fn({_key, v})-> v end)
        other_result = length(Enum.filter(match_counts, fn({_k, v})-> v == max_val end)) > 1
        case other_result do
          false ->
            players_to_update =
              Enum.filter(players, fn(p)-> p.role.name == "citizen-" <> max_key end)
              |> Enum.each(fn(p)->
                changeset = Player.changeset(p, %{achieved_goals_for: Enum.uniq(p.achieved_goals_for ++ ["citizen-" <> max_key])})
                Repo.update(changeset)
              end)
          true ->
            nil
          end
      _ -> nil
    end
  end

  def move_players_to_board(board, game, prev_board \\ nil) do
    if prev_board do
      prev_board = Repo.one from board in Board,
        where: board.id == ^prev_board.id,
        left_join: players in assoc(board, :players),
        left_join: player_role in assoc(players, :role),
        preload: [players: { players, role: player_role }]

      IO.puts "CHECKING GOAILS \r\n"
      IO.inspect prev_board
      check_goals(prev_board.players, prev_board.type, prev_board.matches)
      IO.puts "FINISHED CHECKING GOAILS \r\n"
    end

    players = from(p in Player, where: p.game_id == ^game.id)
      |> Repo.update_all(set: [board_id: board.id, role_id: nil])

    board_topic = "board:" <> Integer.to_string(board.id)

    board = Repo.get(Board, board.id) |> Repo.preload([:roles, :players])

    RoleAssigner.assign_roles(board.roles, board.players, [])
  end

  def toggle_board_is_active(conn, board) do
    board = Repo.get(Board, board.id) |> Repo.preload(:players)
    board_params = %{ board_params_from_repo(board) | "is_active" => !board.is_active }
    changeset = Board.changeset(board, board_params)
    case Repo.update(changeset) do
      {:ok, board} ->
        board
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Sq2.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def set_active_board(conn, %{"game_id" => game_id, "board_id" => board_id}) do
    game = Repo.get_by!(Game, id: game_id)
           |> Repo.preload([:boards, :players])
    active_board = Repo.get_by(Board, is_active: true, game_id: game_id)
    case active_board do
      nil ->
        board = Repo.get_by!(Board, id: board_id) |> Repo.preload([:roles, :players])
        toggle_board_is_active(conn, board)
        move_players_to_board(board, game)
        Sq2.Endpoint.broadcast! "game:" <> game_id, "board:changed", %{"board_slug": board.slug}
        redirect conn, to: "/admin/supervise_game/#{game.id}"
      _ ->
        prev_board = active_board
        toggle_board_is_active(conn, prev_board)
        board = Repo.get_by!(Board, id: board_id) |> Repo.preload([:roles, :players])
        toggle_board_is_active(conn, board)
        move_players_to_board(board, game, prev_board)
        Sq2.Endpoint.broadcast! "game:" <> game_id, "board:changed", %{"board_slug": board.slug}
        redirect conn, to: "/admin/supervise_game/#{game.id}"
    end
  end
end
