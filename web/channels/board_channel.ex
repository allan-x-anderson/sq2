defmodule Sq2.BoardChannel do
  use Phoenix.Channel

  alias Sq2.{Repo, Board}
  alias Sq2.Presence

  intercept ["admin:player-joined", "tile-pressed", "fake-news-published", "real-news-published"]

  def player_from_socket(player) do
    %{ "player" =>
      %{ "name" => player.name, "id" => player.id, "role" => player.role.name, "board_slug" => player.board.slug}
    }
  end

  def join("board:" <> board_id, _params, socket) do
    #Check user board === board
    board = Sq2.Repo.get(Board, board_id)
    player = socket.assigns[:player]
    socket = assign(socket, :board, board)
    case board do
      nil -> {:error, %{reason: "unauthorized"}}
      _ ->
        send self(), :after_join
        {:ok, socket}
    end
  end

  def handle_in("tile-pressed", %{"tile" => tile, "player" => player}, socket) do
    broadcast! socket, "tile-pressed", %{"tile" => tile, "player" => player}
    {:noreply, socket}
  end

  def handle_in("fake-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}, socket) do
    broadcast! socket, "fake-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}
    {:noreply, socket}
  end

  def handle_in("real-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}, socket) do
    broadcast! socket, "real-news-published", %{"board_type" => board_type, "event_name" => event_name, "triggered_count" => triggered_count}
    {:noreply, socket}
  end

  def handle_in("admin:player-joined", %{"player" => player}, socket) do
    broadcast! socket, "admin:player-joined", %{"player" => player}
    {:noreply, socket}
  end

  def handle_in("voting:round-finished", _, socket) do
    broadcast! socket, "voting:round-finished", %{}
    {:noreply, socket}
  end

  def handle_in("matches:new-match", %{"match" => match}, socket) do
    id = socket.assigns.board.id
    board = Repo.get(Board, id)
    current_points = board.points
    new_points = board.points + match["points"]

    current_matches = board.matches
    new_matches = board.matches ++ [match]
    changeset = Board.changeset(board, %{"name"=> board.name, "points" => new_points, "matches" => new_matches})

    case Repo.update(changeset) do
      {:ok, board} ->
        IO.puts "FINNNNNNNNNe"
        broadcast! socket, "matches:new-match", %{"match" => match}
        {:noreply, socket}
      {:error, changeset} ->
        IO.puts "ERRRRRROrRRRRRRRRRRRRRRR"
        IO.inspect changeset
        {:noreply, socket}
    end
  end

  def handle_in("achievements:tile-pressed", %{"tile" => tile}, socket) do
    broadcast! socket, "achievements:tile-pressed", %{"tile" => tile}
    {:noreply, socket}
  end

  def handle_out("tile-pressed", payload, socket) do
    push socket, "tile-pressed", payload
    {:noreply, socket}
  end

  def handle_out("fake-news-published", payload, socket) do
    push socket, "fake-news-published", payload
    {:noreply, socket}
  end

  def handle_out("real-news-published", payload, socket) do
    push socket, "real-news-published", payload
    {:noreply, socket}
  end

  def handle_out("admin:player-joined", payload, socket) do
    push socket, "admin:player-joined", payload
    {:noreply, socket}
  end

  def handle_out("voting:round-finished", _, socket) do
    push socket, "voting:round-finished", %{}
    {:noreply, socket}
  end

  def handle_out("matches:new-match", payload, socket) do
    push socket, "matches:new-match", payload
    {:noreply, socket}
  end

  def handle_out("achievements:tile-pressed", payload, socket) do
    push socket, "achievements:tile-pressed", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    if socket.assigns[:player] do
      Presence.track(socket, socket.assigns.player.id, %{
        online_at: :os.system_time(:milli_seconds),
        player: %{name: socket.assigns.player.name}
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
