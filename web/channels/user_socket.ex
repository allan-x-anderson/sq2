defmodule Sq2.UserSocket do
  use Phoenix.Socket

  ## Channels
   channel "game:*", Sq2.GameChannel
   channel "board:*", Sq2.BoardChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket
  # transport :longpoll, Phoenix.Transports.LongPoll

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  #
  def verify_user(socket, token) do
  end

  def connect(%{"is_admin" => is_admin}, socket) do
    {:ok, socket}
  end

  def connect(%{"is_display" => is_display}, socket) do
    {:ok, socket}
  end

  def connect(%{"token" => token}, socket) do
    case Phoenix.Token.verify(socket, "player", token, max_age: 1209600) do
      {:ok, player_id} ->
        player = Sq2.Repo.get!(Sq2.Player, player_id)
                 |> Sq2.Repo.preload([:role, :board])
        socket = assign(socket, :player, player)
        {:ok, socket}
      {:error, _} ->
        :error
    end
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "users_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Sq2.Endpoint.broadcast("users_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(_socket), do: nil
end
