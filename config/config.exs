# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :sq2,
  ecto_repos: [Sq2.Repo]

# Configures the endpoint
config :sq2, Sq2.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "jVNuHQtt5B4EuXF50VeK3QPqbbO2UUZVUbq0kXp8RZr41VceiFCxXcDwDdl8cooJ",
  render_errors: [view: Sq2.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Sq2.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
