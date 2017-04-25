defmodule Sq2.BoardView do
  use Sq2.Web, :view

  def render("index.json", %{boards: boards}) do
    %{data: render_many(boards, Sq2.BoardView, "board.json")}
  end

  def render("show.json", %{board: board}) do
    %{data: render_one(board, Sq2.BoardView, "board.json")}
  end

  def render("board.json", %{board: board}) do
    %{id: board.id,
      name: board.name}
  end
end
