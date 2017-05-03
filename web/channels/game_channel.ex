defmodule Sq2.GameChannel do
  use Phoenix.Channel

  alias Sq2.{Game, Board, Player}
  alias Sq2.Presence

  def player_from_socket(player) do
    %{ "player" =>
      %{ "name" => player.name, "id" => player.id, "role" => player.role.name, "board_slug" => player.board.slug}
    }
  end

  def join("game:" <> game_id, _params, socket) do
    game = Sq2.Repo.get(Game, game_id)
    player = socket.assigns[:player]
    socket = assign(socket, :game, game)
    {:ok, socket}
  end
end
