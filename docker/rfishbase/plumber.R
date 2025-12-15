library(plumber)
library(rfishbase)
library(jsonlite)

#* Ping
#* @get /ping
function() {
  list(status = "ok")
}

#* Recherche d'une espèce par nom
#* @param name Nom scientifique ou commun
#* @get /species
function(name = NULL) {
  if (is.null(name) || nchar(name) == 0) {
    return(list(error = "provide a 'name' query parameter"))
  }
  res <- tryCatch({
    # rfishbase interroge les datasets HF/Parquet en back-end si configuré
    rfishbase::species(name)
  }, error = function(e) {
    list(error = conditionMessage(e))
  })
  return(res)
}

#* Rechercher des records bruts (exemple utilisant species)
#* @param q chaîne de recherche
#* @get /search
function(q = NULL) {
  if (is.null(q) || nchar(q) == 0) return(list(error = "provide q param"))
  res <- tryCatch({
    # appel simple sur les espèces contenant la chaîne
    df <- rfishbase::species(q)
    df
  }, error = function(e) {
    list(error = conditionMessage(e))
  })
  return(res)
}
