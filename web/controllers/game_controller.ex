defmodule Sq2.GameController do
  use Sq2.Web, :controller

  alias Sq2.{Repo, Game, Board, Player, RoleAssigner}

  def player_from_repo(player) do
    %{ "player" =>
      %{ "id" => player.id, "board_id" => player.board_id, "name" => player.name}
    }
  end

  def join(conn, params) do
    #if conn.current_user
    case conn.method do
      "POST" ->
        %{ "game"=> game_params } = params
        %{ "player"=> player_params } = params
        game = Repo.get_by!(Game, slug: game_params["slug"])
                |> Sq2.Repo.preload([:boards, :players])

        player_params = Map.merge(player_params, %{"game_id" => game.id})

        current_board = Repo.get_by(Board, game_id: game.id, is_active: true) |> Repo.preload([:roles, :players])

        player_changeset =
          case current_board do
            nil ->
              Player.changeset(%Player{}, player_params)
            _ ->
              params_with_role = RoleAssigner.add_role_to_params(current_board.roles, current_board.players, player_params)
              params_with_board_and_role = Map.merge(params_with_role, %{"board_id" => current_board.id})
              Player.changeset(%Player{}, params_with_board_and_role)
          end
        case Repo.insert(player_changeset) do
          {:ok, player} ->
            token = Phoenix.Token.sign(Sq2.Endpoint, "player", player.id)
            IO.inspect player_from_repo(player)
            Sq2.Endpoint.broadcast! "board:" <> Integer.to_string(player.board_id), "admin:player-joined", player_from_repo(player)
            conn
            |> put_status(:created)
            redirect conn, to: "/#{current_board.slug}?token=#{token}&board_id=#{player.board_id}&player_id=#{player.id}"
          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> render(Sq2.ChangesetView, "error.html", changeset: changeset)
            render conn, "join.html"
        end
      _ -> render conn, "join.html"
    end
  end

  def index(conn, _params) do
    games = Sq2.Repo.all(Game)
    render(conn, "index.json", games: games)
  end

  def create(conn, %{"game" => game_params}) do
    changeset = Game.changeset(%Game{}, game_params)

    case Repo.insert(changeset) do
      {:ok, game} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", game_path(conn, :show, game))
        |> render("show.json", game: game)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Sq2.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    game = Repo.get!(Game, id)
    render(conn, "show.json", game: game)
  end

  def update(conn, %{"id" => id, "game" => game_params}) do
    game = Repo.get!(Game, id)
    changeset = Game.changeset(game, game_params)

    case Repo.update(changeset) do
      {:ok, game} ->
        render(conn, "show.json", game: game)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Sq2.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    game = Repo.get!(Game, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(game)

    send_resp(conn, :no_content, "")
  end
end
