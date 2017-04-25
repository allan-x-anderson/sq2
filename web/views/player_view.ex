defmodule Sq2.PlayerView do
  use Sq2.Web, :view

  def render("index.json", %{players: players}) do
    %{data: render_many(players, Sq2.PlayerView, "player.json")}
  end

  def render("show.json", %{player: player}) do
    %{data: render_one(player, Sq2.PlayerView, "player.json")}
  end

  def render("player.json", %{player: player}) do
    %{id: player.id,
      name: player.name}
  end
end
