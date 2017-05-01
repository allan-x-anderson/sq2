defmodule Sq2.Board do
  use Sq2.Web, :model

  schema "boards" do
    field :name, :string
    field :type, :string
    field :slug, :string
    belongs_to :game, Sq2.Game
    has_many :players, Sq2.Player
    has_many :roles, Sq2.Role

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    IO.inspect slugified_name(params)
    params = Map.merge(params, slugified_name(params))
    struct
    |> cast(params, [:name, :type, :game_id, :slug])
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
