defmodule Sq2.GameView do
  use Sq2.Web, :view

  def render("index.json", %{games: games}) do
    %{data: render_many(games, Sq2.GameView, "game.json")}
  end

  def render("show.json", %{game: game}) do
    %{data: render_one(game, Sq2.GameView, "game.json")}
  end

  def render("game.json", %{game: game}) do
    %{id: game.id,
      name: game.name}
  end
end
