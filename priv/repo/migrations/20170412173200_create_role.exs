defmodule Sq2.Repo.Migrations.CreateRole do
  use Ecto.Migration

  def change do
    create table(:roles) do
      add :name, :string
      add :percentage_of_players, :integer
      add :board_id, references(:boards)

      timestamps()
    end

  end
end
