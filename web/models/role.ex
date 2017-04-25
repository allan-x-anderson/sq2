defmodule Sq2.Role do
  use Sq2.Web, :model

  schema "roles" do
    field :name, :string
    belongs_to :board, Sq2.Board

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :board_id])
    |> validate_required([:name, :board_id])
  end
end
