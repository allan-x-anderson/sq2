defmodule Sq2.Game do
  use Sq2.Web, :model

  schema "games" do
    field :name, :string
    has_many :boards, Sq2.Board

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name])
    |> validate_required([:name])
  end
end
