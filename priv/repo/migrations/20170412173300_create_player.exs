defmodule Sq2.Repo.Migrations.CreatePlayer do
  use Ecto.Migration

  def change do
    create table(:players) do
      add :name, :string
      add :achieved_goals_for, {:array, :string}, default: []
      add :role_id, references(:roles)
      add :board_id, references(:boards)
      add :game_id, references(:games)

      timestamps()
    end

  end
end
