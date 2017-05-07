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

  def build_board(game, board_name, type, roles, is_active) do
    board = %Sq2.Board{game_id: game.id, name: board_name, type: type, is_active: is_active, slug: Sq2.SeedsHelper.get_slug(board_name)}
    board = Sq2.Repo.insert!(board)
    Enum.each(roles, fn(role)->
      role = %Sq2.Role{board_id: board.id, name: role.name, percentage_of_players: role.percentage_of_players}
      Sq2.Repo.insert!(role)
    end)
  end

end

game = %Sq2.Game{name: "planpolitik", slug: Sq2.Game.slugified_name(%{"name"=> "planpolitik"})["slug"]}
game = Sq2.Repo.insert!(game)
IO.inspect game

# board_1 = %Sq2.Board{game_id: game.id, name: "Chapter 1", type: "anarchy", is_active: true, slug: Sq2.SeedsHelper.get_slug("Chapter 1")}
# board_1 = Sq2.Repo.insert!(board_1)
# board_1_role_1 = %Sq2.Role{board_id: board_1.id, name: "citizen", percentage_of_players: 100}
# Sq2.Repo.insert!(board_1_role_1)
#

board_1_roles = [
  %{name: "player", percentage_of_players: 100}
]
board_1 = Sq2.SeedsHelper.build_board(game, "Lobby", "lobby", board_1_roles, true)

board_2_roles = [
  %{name: "citizen", percentage_of_players: 100}
]
board_2 = Sq2.SeedsHelper.build_board(game, "Chapter 1", "anarchy", board_2_roles, false)

board_3_roles = [
  %{name: "rich", percentage_of_players: 15},
  %{name: "poor", percentage_of_players: 25},
  %{name: "middle_class", percentage_of_players: 60}
]
board_3 = Sq2.SeedsHelper.build_board(game, "Chapter 2", "inequality", board_3_roles, false)

board_4_roles = [
  %{name: "citizen", percentage_of_players: 60},
  %{name: "breibarter", percentage_of_players: 10},
  %{name: "researcher", percentage_of_players: 30}
]
board_4 = Sq2.SeedsHelper.build_board(game, "Chapter 3", "fake_news", board_4_roles, false)

board_5_roles = [
  %{name: "citizen-red", percentage_of_players: 40},
  %{name: "citizen-blue", percentage_of_players: 40},
  %{name: "citizen-green", percentage_of_players: 20}
]
board_5 = Sq2.SeedsHelper.build_board(game, "Chapter 4", "democracy", board_5_roles, false)
