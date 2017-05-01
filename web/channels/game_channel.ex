defmodule Sq2.GameChannel do
  use Phoenix.Channel

  alias Sq2.{Role, Board, Player}
  alias Sq2.Presence


  @roles ["rich", "poor"]

  def player_from_socket(player) do
    %{ "player" =>
      %{ "name" => player.name, "id" => player.id, "role" => player.role.name, "board_slug" => player.board.slug}
    }
  end

  # def join("game:board", message, socket) do
  #   IO.puts "WHY HERE MATE"
  #   board = Sq2.Repo.get(Board, 1)
  #   |> Sq2.Repo.preload([:roles])
  #   {:ok, socket}
  # end

  def join("game:board:" <> board_id, _params, socket) do
    #Check user board === board
    board = Sq2.Repo.get(Board, board_id)
    player = socket.assigns[:player]
    socket = assign(socket, :board, board)
    case board do
      nil -> {:error, %{reason: "unauthorized"}}
      _ ->
        if player do
          Sq2.Endpoint.broadcast! "game:board:" <> board_id, "player:joined", player_from_socket(player)
        end
        send self(), :after_join
        {:ok, socket}
    end
  end

  def handle_in("tile-pressed", %{"tile" => tile, "player" => player}, socket) do
    broadcast! socket, "tile-pressed", %{"tile" => tile, "player" => player}
    {:noreply, socket}
  end

  def handle_out("tile-pressed", payload, socket) do
    push socket, "tile-pressed", payload
    {:noreply, socket}
  end

  def handle_in("fake-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}, socket) do
    broadcast! socket, "fake-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}
    {:noreply, socket}
  end

  def handle_out("fake-news-published", payload, socket) do
    push socket, "fake-news-published", payload
    {:noreply, socket}
  end

  def handle_in("real-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}, socket) do
    broadcast! socket, "real-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}
    {:noreply, socket}
  end

  def handle_out("real-news-published", payload, socket) do
    push socket, "real-news-published", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    IO.puts socket.assigns.board.slug
    if socket.assigns[:player] do
      Presence.track(socket, socket.assigns.player.id, %{
        online_at: :os.system_time(:milli_seconds)
      })
      # IO.puts socket.assigns.player.board.slug
      # Presence.track(self(), "board_presence_" <> socket.assigns.player.board.slug, socket.assigns.player.id, %{
      #   online_at: :os.system_time(:milli_seconds)
      # })
      # push socket, "presence_state", Presence.list("board_presence_" <> socket.assigns.player.board.slug)
      push socket, "presence_state", Presence.list(socket)
    else
      push socket, "presence_state", Presence.list(socket)
      # push socket, "presence_state", Presence.list("board_presence_" <> socket.assigns.board.slug)
    end
    {:noreply, socket}
  end
end
