defmodule Sq2.RoleView do
  use Sq2.Web, :view

  def render("index.json", %{roles: roles}) do
    %{data: render_many(roles, Sq2.RoleView, "role.json")}
  end

  def render("show.json", %{role: role}) do
    %{data: render_one(role, Sq2.RoleView, "role.json")}
  end

  def render("role.json", %{role: role}) do
    %{id: role.id,
      name: role.name}
  end
end
