defmodule Sq2.BoardController do
  use Sq2.Web, :controller

  alias Sq2.Board
  alias Sq2.Player

  def index(conn, _params) do
    render conn, "index.html"
  end

  def supervise(conn, %{"board_slug" => slug}) do
    board = Repo.get_by!(Board, slug: slug)
    board_topic = "game:board:" <> Integer.to_string(board.id)
    current_presences =
      Sq2.Presence.list(board_topic)
      |> Poison.encode!
    #Get board
    render conn, "supervise.html", board: board, current_presences: current_presences
  end

  def find_percentage_of_players_in_role(role, players) do
    matches = Enum.filter(players, fn(%Player{role_id: role_id}) -> role_id == role.id end)
    %{role: role, percent_filled: (length(matches)  / length(players)) * 100 }
  end

  def find_role(roles, players) when length(players) == 0 do
    List.first(roles)
  end

  def find_role(roles, players) do
    IO.puts "****************************"
    role_percentages = Enum.map(roles, fn(role)-> find_percentage_of_players_in_role(role, players) end)
    least_filled = Enum.min_by(role_percentages, fn(rp)-> rp.percent_filled end)
    IO.inspect least_filled.role
    least_filled.role
  end

  def add_role_to_params(roles, players, params) do
    Map.merge(params, %{"role_id" => find_role(roles, players).id})
  end

  def join(conn, params) do
    #if conn.current_user
    case conn.method do
      "POST" ->
        %{ "board"=> board_params } = params
        %{ "player"=> player_params } = params
        board = Repo.get_by!(Board, slug: board_params["slug"])
                |> Sq2.Repo.preload([:roles, :players])
        #get role
        params_with_role = add_role_to_params(board.roles, board.players, params["player"])
        params_with_board_and_role = Map.merge(params_with_role, %{"board_id" => board.id})
        player_changeset = Player.changeset(%Player{}, params_with_board_and_role)
        case Repo.insert(player_changeset) do
          {:ok, player} ->
            #DO CREATE Current player on conn
            token = Phoenix.Token.sign(Sq2.Endpoint, "player", player.id)
            conn
            |> put_status(:created)
            redirect conn, to: "/#{board.slug}?token=#{token}&board_id=#{player.board_id}&player_id=#{player.id}"
          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            #|> render(Sq2.ChangesetView, "error.json", changeset: changeset)
            render conn, "join.html"
        end
      _ -> render conn, "join.html"
    end
    # If the board_slug exists as a board then create a user, assign to that board
    # and redirect to the board_slug
  end

  def player_from_repo(player) do
    %{ "player" =>
      %{ "name" => player.name, "id" => player.id, "role" => player.role.name}
    }
  end

  def play(conn, %{"board_slug" => slug, "player_id" => player_id} = params) do
    player = Repo.get!(Player, player_id)
            |> Sq2.Repo.preload([:role])
    board = Repo.get_by!(Board, slug: slug)
            |> Sq2.Repo.preload([:players])
    board_topic = "game:board:" <> Integer.to_string(board.id)
    IO.puts "board_topic"
    IO.puts board_topic
    current_presences =
      Sq2.Presence.list(board_topic)
      |> Poison.encode!
    render conn, "play.html", board: board, player: player_from_repo(player), current_presences: current_presences
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
