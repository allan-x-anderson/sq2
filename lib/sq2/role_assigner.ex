defmodule Sq2.RoleAssigner do

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

  def add_role_to_params(roles, players, params) do
    IO.puts "****************************"
    IO.inspect roles
    IO.inspect players
    IO.inspect params
    Map.merge(params, %{"role_id" => find_role(roles, players).id})
  end

end
