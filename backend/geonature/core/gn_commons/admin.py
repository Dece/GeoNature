from flask_admin.contrib.sqla import ModelView

class BibFieldAdmin(ModelView):
    form_columns = (
        "type_widget", "field_name", "field_label", "required", "description",
        "quantitative", "unity", "field_values", "bib_nomenclature_type", "id_list",
        "modules", "objects", "datasets"
    )

    column_display_all_relations = True
    # form_columns = ('truc', BibFields.field_name)
    # column_labels = dict(name='Name', last_name='Last Name')
    form_args = {
        "field_name": {"label":"Nom du champ"},
        "bib_nomenclature_type": {"label":"Type de nomenclature"},
        "field_label": {"label":"Label du champ"},
        "required": {"label":"Obligatoire"},
        "quantitative": {"label":"Quantitatif"},
        "unity": {"label":"Unité"},
        "field_values": {"label":"Valeurs"},
    }
    column_descriptions = {
        "bib_nomenclature_type":'Si Type widget = Nomenclature',
        "field_label":'Label du champ en interface',
        "field_name":'Nom du champ en base de donnée',
        "field_values":'Obligatoire si widget = select/radio/bool_radio (tableau de valeurs ou tableau clé/valeur. Utilisez des doubles quotes pour les valeurs et les clés)',
        "id_list":'Identifiant en BDD de la liste (pour Type widget = taxonomy/observers)',

    }


