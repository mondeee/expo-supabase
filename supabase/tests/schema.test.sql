begin;

select plan(3);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'todos', 'todos table exists');
select has_column('public', 'todos', 'user_id', 'todos are linked to an auth user');

select * from finish();

rollback;
