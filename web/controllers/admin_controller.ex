defmodule Sq2.AdminController do
  use Sq2.Web, :controller

  alias Sq2.{Game, User, Board}

  def index(conn, _params) do
    games = Sq2.Repo.all(Game)
    boards = Sq2.Repo.all(Board)
             |> Sq2.Repo.preload([:roles])
    render(conn, "index.html", games: games, boards: boards)
  end

  def supervise_game(conn, %{"game_id" => id}) do
    game = Repo.get_by!(Game, id: id)
           |> Sq2.Repo.preload(boards: (from b in Board, order_by: [desc: b.inserted_at]))
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
    render conn, "supervise_game.html", game: game, online_players: online_players
  end
end
