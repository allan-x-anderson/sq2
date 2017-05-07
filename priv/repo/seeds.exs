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

board_1 = %Sq2.Board{game_id: game.id, name: "Chapter 1", type: "anarchy", is_active: true, slug: Sq2.SeedsHelper.get_slug("Chapter 1")}
board_1 = Sq2.Repo.insert!(board_1)
board_1_role_1 = %Sq2.Role{board_id: board_1.id, name: "citizen", percentage_of_players: 100}
Sq2.Repo.insert!(board_1_role_1)

board_2 = %Sq2.Board{game_id: game.id, name: "Chapter 2", type: "inequality", slug: Sq2.SeedsHelper.get_slug("Chapter 2")}
board_2 = Sq2.Repo.insert!(board_2)
board_2_role_1 = %Sq2.Role{board_id: board_2.id, name: "rich", percentage_of_players: 15}
board_2_role_2 = %Sq2.Role{board_id: board_2.id, name: "poor", percentage_of_players: 25}
board_2_role_3 = %Sq2.Role{board_id: board_2.id, name: "middle_class", percentage_of_players: 60}
Sq2.Repo.insert!(board_2_role_1)
Sq2.Repo.insert!(board_2_role_2)
Sq2.Repo.insert!(board_2_role_3)

board_3 = %Sq2.Board{game_id: game.id, name: "Chapter 3", type: "fake_news",  slug: Sq2.SeedsHelper.get_slug("Chapter 3")}
board_3 = Sq2.Repo.insert!(board_3)
board_3_role_1 = %Sq2.Role{board_id: board_3.id, name: "citizen", percentage_of_players: 60}
board_3_role_2 = %Sq2.Role{board_id: board_3.id, name: "breibarter", percentage_of_players: 10}
board_3_role_3 = %Sq2.Role{board_id: board_3.id, name: "researcher", percentage_of_players: 30}
Sq2.Repo.insert!(board_3_role_1)
Sq2.Repo.insert!(board_3_role_2)
Sq2.Repo.insert!(board_3_role_3)

board_4 = %Sq2.Board{game_id: game.id, name: "Chapter 4", type: "democracy",  slug: Sq2.SeedsHelper.get_slug("Chapter 4")}
board_4 = Sq2.Repo.insert!(board_4)
board_4_role_1 = %Sq2.Role{board_id: board_4.id, name: "citizen-red", percentage_of_players: 40}
board_4_role_2 = %Sq2.Role{board_id: board_4.id, name: "citizen-blue", percentage_of_players: 40}
board_4_role_3 = %Sq2.Role{board_id: board_4.id, name: "citizen-green", percentage_of_players: 20}
Sq2.Repo.insert!(board_4_role_1)
Sq2.Repo.insert!(board_4_role_2)
Sq2.Repo.insert!(board_4_role_3)
