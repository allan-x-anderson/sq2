defmodule Sq2.Repo.Migrations.CreateBoard do
  use Ecto.Migration

  def change do
    create table(:boards) do
      add :name, :string
      add :slug, :string
      add :type, :string
      add :matches, {:array, :map}, default: []
      add :is_active, :boolean, default: false
      add :points, :integer, default: 0
      add :game_id, references(:games)

      timestamps()
    end

  end
end
