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

  def handle_in("board:changed", %{"board_slug" => board_slug}, socket) do
    broadcast! socket, "board:changed", %{"board_slug" => board_slug}
    {:noreply, socket}
  end

  def handle_out("board:changed", payload, socket) do
    push socket, "board:changed", payload
    {:noreply, socket}
  end
end
