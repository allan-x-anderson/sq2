defmodule Sq2.AdminController do
  use Sq2.Web, :controller

  alias Sq2.{Repo, Game, User, Board}

  def index(conn, _params) do
    games = Repo.all(Game)
    boards = Repo.all(Board)
             |> Repo.preload([:roles])
    render(conn, "index.html", games: games, boards: boards)
  end

  def supervise_game(conn, %{"game_id" => id}) do
    game = Repo.get_by!(Game, id: id)
           |> Repo.preload(boards: (from b in Board, order_by: [desc: b.inserted_at]))
    # game = first Sq2.Repo.all(Game)
    # board = Repo.get_by!(Board, slug: slug)
    #         |> Sq2.Repo.preload([:roles])
    online_players =
      game.boards
      |> Enum.reduce(Map.new(), fn(board, acc)->
        board_topic = "board:" <> Integer.to_string(board.id)
        acc = Map.put(acc, board.id, Sq2.Presence.list(board_topic))
      end)

    game_json = Poison.encode! game
    # current_presences =
    #   Sq2.Presence.list(board_topic)
    #   |> Poison.encode!
    render conn, "supervise_game.html", game: game
  end

  def board_params_from_repo(board) do
      %{ "id" => board.id, "game_id"=> board.game_id, "name" => board.name, "type" => board.type, "is_active" => board.is_active }
  end

  def toggle_board_is_active(conn, board) do
    IO.inspect(board_params_from_repo(board))
    board_params = %{ board_params_from_repo(board) | "is_active" => !board.is_active }
    changeset = Board.changeset(board, board_params)
    IO.inspect changeset
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
           |> Repo.preload(:boards)
    active_board = Repo.get_by(Board, is_active: true, game_id: game_id)
    case active_board do
      nil ->
        board = Repo.get_by!(Board, id: board_id)
        toggle_board_is_active(conn, board)
        #TODO Emit game channel board changed
        redirect conn, to: "/admin/supervise_game/#{game.id}"
      _ ->
        prev_board = active_board
        toggle_board_is_active(conn, prev_board)
        board = Repo.get_by!(Board, id: board_id)
        toggle_board_is_active(conn, board)
        #TODO Emit game channel board changed
        redirect conn, to: "/admin/supervise_game/#{game.id}"
    end
  end
end
