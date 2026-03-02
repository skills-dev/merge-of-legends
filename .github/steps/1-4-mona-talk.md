{%- if not_asc_count == 0 %}
<img alt="Hmm... My staff does not sense any more corruption. Well done, adventurer!" src="../images/mona-corruption-cleared.png"/>

{%- else %}
<img width="250px" align="left" alt="Mona" src="../images/mona-portrait.png"/>

Hmm... Upon inspection with my staff, it confirms the mainline is still corrupt.

Check your haste and visit the base once more.
I sense `{{ not_asc_count }}` moments need further consideration.

{%- endif %}
