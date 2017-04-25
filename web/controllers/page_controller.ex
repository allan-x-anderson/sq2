defmodule Sq2.PageController do
  use Sq2.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
