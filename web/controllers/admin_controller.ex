defmodule Sq2.AdminController do
  use Sq2.Web, :controller

  alias Sq2.{Game, User, Board}

  def index(conn, _params) do
    games = Sq2.Repo.all(Game)
    boards = Sq2.Repo.all(Board)
             |> Sq2.Repo.preload([:roles])
    render(conn, "index.html", games: games, boards: boards)
  end
end
