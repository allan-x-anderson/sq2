defmodule Sq2.BoardController do
  use Sq2.Web, :controller

  alias Sq2.{Repo, Game, Board, Player, RoleAssigner }

  def index(conn, _params) do
    render conn, "index.html"
  end

  def role_from_repo(role) do
    %{ "role" =>
      %{ "id" => role.id, "name": role.name }
    }
  end

  def board_from_repo(board) do
    %{ "board" =>
      %{ "id" => board.id, "game_id"=> board.game_id, "name"=> board.name, "type" => board.type, "points" => board.points, "roles" => Enum.map(board.roles, fn (role) -> role_from_repo(role) end )}
    }
  end

  def display(conn, %{"board_slug" => slug}) do
    board = Repo.get_by!(Board, slug: slug)
            |> Repo.preload([:roles])
    game = Repo.get_by!(Game, id: board.game_id) |> Repo.preload(boards: from(b in Board, order_by: [asc: b.inserted_at]))
    board_topic = "board:" <> Integer.to_string(board.id)
    current_presences =
      Sq2.Presence.list(board_topic)
      |> Poison.encode!
    render conn, "display.html", game: game, board: board_from_repo(board), current_presences: current_presences
  end

  def player_from_repo(player) do
    %{ "player" =>
      %{ "id" => player.id, "board_id" => player.board_id, "name" => player.name, "role" => player.role.name}
    }
  end

  def play(conn, %{"board_slug" => slug, "player_id" => player_id} = params) do
    player = Repo.get!(Player, player_id)
            |> Repo.preload([:role])
    board = Repo.get_by!(Board, slug: slug)
            |> Repo.preload([:players, :roles])
    board_topic = "board:" <> Integer.to_string(board.id)
    current_presences =
      Sq2.Presence.list(board_topic)
    render conn, "play.html", board: board_from_repo(board), player: player_from_repo(player), current_presences: current_presences
  end


  def create(conn, %{"board" => board_params}) do
    changeset = Board.changeset(%Board{}, board_params)

    case Repo.insert(changeset) do
      {:ok, board} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", board_path(conn, :show, board))
        |> render("show.json", board: board)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Sq2.ChangesetView, "error.json", changeset: changeset)
    end
  end

  # def show(conn, %{"id" => id}) do
  #   board = Repo.get!(Board, id)
  #   render(conn, "show.json", board: board)
  # end

  def update(conn, %{"id" => id, "board" => board_params}) do
    board = Repo.get!(Board, id)
    changeset = Board.changeset(board, board_params)

    case Repo.update(changeset) do
      {:ok, board} ->
        render(conn, "show.json", board: board)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Sq2.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    board = Repo.get!(Board, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(board)

    send_resp(conn, :no_content, "")
  end
end
