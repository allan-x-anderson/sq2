defmodule Sq2.Player do
  use Sq2.Web, :model

  schema "players" do
    field :name, :string
    belongs_to :role, Sq2.Role
    belongs_to :board, Sq2.Board
    belongs_to :game, Sq2.Game

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :role_id, :board_id, :game_id])
    |> validate_required([:name, :game_id])
  end
end
