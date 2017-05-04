defmodule Sq2.Game do
  use Sq2.Web, :model
  @derive {Poison.Encoder, only: [:id, :name, :slug]}

  schema "games" do
    field :name, :string
    field :slug, :string
    has_many :boards, Sq2.Board
    has_many :players, Sq2.Player

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    params = Map.merge(params, slugified_name(params))
    struct
    |> cast(params, [:name, :slug])
    |> validate_required([:name])
  end

  def slugified_name(%{"name" => name}) do
    slugged_name = name
      |> String.downcase
      |> String.replace(~r/[^a-z0-9\s-]/, "")
      |> String.replace(~r/(\s|-)+/, "-")
    %{"slug" => slugged_name}
  end
end
