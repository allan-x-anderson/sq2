# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Sq2.Repo.insert!(%Sq2.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
defmodule Sq2.SeedsHelper do
  def get_slug(name) do
    Sq2.Board.slugified_name(%{"name"=> name})["slug"]
  end
end

game = %Sq2.Game{name: "planpolitik", slug: Sq2.Game.slugified_name(%{"name"=> "planpolitik"})["slug"]}
game = Sq2.Repo.insert!(game)
IO.inspect game

board_1 = %Sq2.Board{game_id: game.id, name: "The Beginning", type: "anarchy", is_active: true, slug: Sq2.SeedsHelper.get_slug("The Beginning")}
board_1 = Sq2.Repo.insert!(board_1)

IO.inspect board_1
board_1_role_1 = %Sq2.Role{board_id: board_1.id, name: "citizen"}
Sq2.Repo.insert!(board_1_role_1)

board_2 = %Sq2.Board{game_id: game.id, name: "The Awakening", type: "inequality", slug: Sq2.SeedsHelper.get_slug("The Awakening")}
board_2 = Sq2.Repo.insert!(board_2)
board_2_role_1 = %Sq2.Role{board_id: board_2.id, name: "rich"}
board_2_role_2 = %Sq2.Role{board_id: board_2.id, name: "poor"}
board_2_role_3 = %Sq2.Role{board_id: board_2.id, name: "middle_class"}
Sq2.Repo.insert!(board_2_role_1)
Sq2.Repo.insert!(board_2_role_2)
Sq2.Repo.insert!(board_2_role_3)

board_3 = %Sq2.Board{game_id: game.id, name: "The Informing", type: "fake_news",  slug: Sq2.SeedsHelper.get_slug("The Informing")}
board_3 = Sq2.Repo.insert!(board_3)
board_3_role_1 = %Sq2.Role{board_id: board_3.id, name: "citizen"}
Sq2.Repo.insert!(board_3_role_1)
