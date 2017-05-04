defmodule Sq2.Repo.Migrations.CreateBoard do
  use Ecto.Migration

  def change do
    create table(:boards) do
      add :name, :string
      add :slug, :string
      add :type, :string
      add :is_active, :boolean, default: false
      add :game_id, references(:games)

      timestamps()
    end

  end
end
