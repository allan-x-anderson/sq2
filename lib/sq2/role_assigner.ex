defmodule Sq2.RoleAssigner do
  alias Sq2.{Player, Repo}
  def find_percentage_of_players_in_role(role, players) do
    matches = Enum.filter(players, fn(%Sq2.Player{role_id: role_id}) -> role_id == role.id end)
    %{role: role, percent_filled: (length(matches)  / length(players)) * 100 }
  end

  def find_role(roles, players) when length(players) == 0 do
    List.first(roles)
  end

  def find_role(roles, players) do
    role_percentages = Enum.map(roles, fn(role)-> find_percentage_of_players_in_role(role, players) end)
    least_filled = Enum.min_by(role_percentages, fn(rp)-> rp.percent_filled end)
    IO.inspect least_filled.role
    least_filled.role
  end

  def update_role(player, role) do
    player = Repo.get_by(Player, id: player.id)
    changeset = Player.changeset(player, %{role_id: role.id})
    Repo.update!(changeset)
  end

  def assign_roles(roles, [], assigned_players) do
    IO.puts "LAST"
    nil
  end

  def assign_roles(roles, players, [] = assigned_players) do
    IO.puts "ONE PLAYER"
    IO.puts "^^^^^^^"
    [player | remaining_players] = players
    role = List.first(roles)
    player = update_role(player, role)
    IO.inspect player
    assigned_players = [] ++ [player]
    assign_roles(roles, remaining_players, assigned_players)
  end

  def assign_roles(roles, players, assigned_players) do
    [player | remaining_players] = players
    role = find_role(roles, assigned_players)
    # role = List.first(roles)
    player = update_role(player, role)
    assigned_players = assigned_players ++ [player]
    assign_roles(roles, remaining_players, assigned_players)
  end

  def add_role_to_params(roles, players, params) do
    Map.merge(params, %{"role_id" => find_role(roles, players).id})
  end
end
