defmodule Sq2.GameTest do
  use Sq2.ModelCase

  alias Sq2.Game

  @valid_attrs %{name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Game.changeset(%Game{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Game.changeset(%Game{}, @invalid_attrs)
    refute changeset.valid?
  end
end
