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
      left_join: roles in assoc(boards, :roles),
      preload: [boards: {boards, roles: roles}, players: players]
    online_players =
      game.boards
      |> Enum.reduce(Map.new(), fn(board, acc)->
        board_topic = "board:" <> Integer.to_string(board.id)
        acc = Map.put(acc, board.id, Sq2.Presence.list(board_topic))
      end)

    game_json = Poison.encode! game
    render conn, "supervise_game.html", game: game
  end

  def board_params_from_repo(board) do
      %{ "id" => board.id, "game_id"=> board.game_id, "name" => board.name, "type" => board.type, "is_active" => board.is_active }
  end

  def move_players_to_board(board, game) do
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
        move_players_to_board(board, game)
        Sq2.Endpoint.broadcast! "game:" <> game_id, "board:changed", %{"board_slug": board.slug}
        redirect conn, to: "/admin/supervise_game/#{game.id}"
    end
  end
end
