defmodule Sq2.Repo.Migrations.CreatePlayer do
  use Ecto.Migration

  def change do
    create table(:players) do
      add :name, :string
      add :role_id, references(:roles)
      add :board_id, references(:boards)

      timestamps()
    end

  end
end
