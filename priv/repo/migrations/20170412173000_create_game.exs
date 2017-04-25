defmodule Sq2.Repo.Migrations.CreateGame do
  use Ecto.Migration

  def change do
    create table(:games) do
      add :name, :string

      timestamps()
    end

  end
end
