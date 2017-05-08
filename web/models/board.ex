defmodule Sq2.Board do
  use Sq2.Web, :model
  # @derive {Poison.Encoder, only: [:name, :type, :slug, :players, :roles]}

  schema "boards" do
    field :name, :string
    field :type, :string
    field :slug, :string
    field :is_active, :boolean
    field :points, :integer
    field :matches, {:array, :map}
    belongs_to :game, Sq2.Game
    has_many :players, Sq2.Player
    has_many :roles, Sq2.Role

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    params = Map.merge(params, slugified_name(params))
    IO.puts "PARAMS"
    IO.inspect params
    struct
    |> cast(params, [:name, :type, :game_id, :slug, :is_active, :points, :matches])
    |> validate_required([:name, :type, :game_id])
  end

  def slugified_name(%{"name" => name}) do
    slugged_name = name
      |> String.downcase
      |> String.replace(~r/[^a-z0-9\s-]/, "")
      |> String.replace(~r/(\s|-)+/, "-")
    %{"slug" => slugged_name}
  end
end
