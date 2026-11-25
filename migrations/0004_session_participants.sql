alter table sessions add column if not exists participants text;

update sessions
set participants = json_build_array(agent_a::json, agent_b::json)::text
where participants is null;
