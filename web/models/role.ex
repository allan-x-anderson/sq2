defmodule Sq2.Role do
  use Sq2.Web, :model

  schema "roles" do
    field :name, :string
    field :percentage_of_players, :integer
    belongs_to :board, Sq2.Board
    has_many :players, Sq2.Player

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :board_id, :percentage_of_players])
    |> validate_required([:name, :board_id, :percentage_of_players])
  end
end
