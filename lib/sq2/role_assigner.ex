defmodule Sq2.RoleAssigner do
  alias Sq2.{Player, Repo}
  def percentage_of_players_in_role(role, players) do
    matches = Enum.filter(players, fn(%Sq2.Player{role_id: role_id}) -> role_id == role.id end)
    case length matches do
      0 ->
        0
      _ ->
        (length(matches)  / length(players)) * 100
    end

  end

  def roles_not_at_capacity(roles, players) do
    Enum.reduce(roles, [], fn(role, acc)->
      role_available = case percentage_of_players_in_role(role, players) <= role.percentage_of_players do
        true -> [role]
        _ -> []
      end
      acc ++ role_available
    end)
  end

  def find_role(roles, players) do
    roles_percentage_filled_difference_from_max = Enum.map(roles, fn(role)->
      # IO.puts "POP: "
      # IO.puts role.percentage_of_players
      # IO.puts "- PIR:"
      # IO.puts percentage_of_players_in_role(role, players)
      %{ role: role, percent_filled: role.percentage_of_players - percentage_of_players_in_role(role, players) }
    end)
    Enum.max_by(roles_percentage_filled_difference_from_max, fn(rp)-> rp.percent_filled end).role
  end

  def update_role(player, role) do
    player = Repo.get_by(Player, id: player.id)
    changeset = Player.changeset(player, %{role_id: role.id})
    Repo.update!(changeset)
  end

  def assign_roles(roles, [], assigned_players) do
    nil
  end

  def assign_roles(roles, players, []) do
    [player | remaining_players] = players
    role = Enum.random(roles)
    player = update_role(player, role)
    assigned_players = [] ++ [player]
    assign_roles(roles, remaining_players, assigned_players)
  end

  def assign_roles(roles, players, assigned_players) do
    [player | remaining_players] = players
    role = find_role(roles, assigned_players)
    player = update_role(player, role)
    assigned_players = assigned_players ++ [player]
    assign_roles(roles, remaining_players, assigned_players)
  end

  def add_role_to_params(roles, players, params) do
    Map.merge(params, %{"role_id" => find_role(roles, players).id})
  end
end
