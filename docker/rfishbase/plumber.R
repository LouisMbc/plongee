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

#* Recherche partielle d'espèces
#* @param q chaîne de recherche partielle
#* @get /search
function(q = NULL) {
  if (is.null(q) || nchar(q) < 2) {
    return(list(error = "La recherche doit contenir au moins 2 caractères"))
  }
  
  res <- tryCatch({
    # Récupérer toutes les espèces disponibles
    all_species <- rfishbase::load_taxa()
    
    # Filtrer par correspondance partielle (insensible à la casse)
    pattern <- tolower(q)
    matches <- all_species[
      grepl(pattern, tolower(all_species$Species), fixed = FALSE) |
      grepl(pattern, tolower(all_species$Genus), fixed = FALSE) |
      grepl(pattern, tolower(all_species$FBname), fixed = FALSE),
    ]
    
    # Limiter à 20 résultats
    if (nrow(matches) > 20) {
      matches <- head(matches, 20)
    }
    
    # Retourner les colonnes importantes
    if (nrow(matches) > 0) {
      matches[, c("Species", "Genus", "FBname", "SpecCode")]
    } else {
      list()
    }
    
  }, error = function(e) {
    list(error = conditionMessage(e))
  })
  
  return(res)
}

#* Liste paginée d'espèces (avec images)
#* @param page Numéro de page
#* @param limit Nombre de résultats par page
#* @get /species/list
function(page = 1, limit = 12) {
  page <- as.integer(page)
  limit <- as.integer(limit)
  
  if (page < 1) page <- 1
  if (limit < 1 || limit > 50) limit <- 12
  
  res <- tryCatch({
    # Charger toutes les données UNE SEULE FOIS avec images
    if (!exists("CACHED_SPECIES", envir = .GlobalEnv)) {
      message("Chargement initial des espèces avec images...")
      .GlobalEnv$CACHED_SPECIES <- rfishbase::species()
      message("Espèces chargées: ", nrow(.GlobalEnv$CACHED_SPECIES))
    }
    
    all_species <- .GlobalEnv$CACHED_SPECIES
    
    # Calculer offset
    offset <- (page - 1) * limit
    total <- nrow(all_species)
    end_idx <- min(offset + limit, total)
    
    if (offset >= total) {
      return(list(
        species = list(),
        page = page,
        limit = limit,
        total = total
      ))
    }
    
    page_species <- all_species[(offset + 1):end_idx, ]
    
    # Construire réponse avec images
    result <- lapply(1:nrow(page_species), function(i) {
      sp <- page_species[i, ]
      image_url <- if (!is.null(sp$PicPreferredName) && !is.na(sp$PicPreferredName) && sp$PicPreferredName != "") {
        paste0("https://www.fishbase.se/images/species/", sp$PicPreferredName)
      } else {
        NA
      }
      
      list(
        Species = sp$Species,
        Genus = sp$Genus,
        FBname = if (!is.null(sp$FBname) && !is.na(sp$FBname)) sp$FBname else sp$Species,
        SpecCode = if (!is.null(sp$SpecCode)) sp$SpecCode else NA,
        ImageURL = image_url
      )
    })
    
    list(
      species = result,
      page = page,
      limit = limit,
      total = total
    )
    
  }, error = function(e) {
    list(error = conditionMessage(e))
  })
  
  return(res)
}

#* Détails complets d'une espèce par SpecCode
#* @param specCode Code de l'espèce
#* @get /species/details
function(specCode = NULL) {
  if (is.null(specCode)) {
    return(list(error = "specCode est requis"))
  }
  
  specCode <- as.integer(specCode)
  
  res <- tryCatch({
    if (exists("CACHED_SPECIES", envir = .GlobalEnv)) {
      all_species <- .GlobalEnv$CACHED_SPECIES
      species_data <- all_species[all_species$SpecCode == specCode, ]
      
      if (nrow(species_data) > 0) {
        sp <- species_data[1, ]
        # S'assurer que Species est une chaîne
        species_name <- as.character(sp$Species)
        
        return(list(
          Species = species_name,
          Genus = as.character(sp$Genus),
          FBname = if (!is.null(sp$FBname) && !is.na(sp$FBname)) as.character(sp$FBname) else NA,
          SpecCode = as.integer(sp$SpecCode),
          Author = if (!is.null(sp$Author) && !is.na(sp$Author)) as.character(sp$Author) else NA,
          BodyShapeI = if (!is.null(sp$BodyShapeI) && !is.na(sp$BodyShapeI)) as.character(sp$BodyShapeI) else NA,
          Fresh = if (!is.null(sp$Fresh)) as.integer(sp$Fresh) else NA,
          Brack = if (!is.null(sp$Brack)) as.integer(sp$Brack) else NA,
          Saltwater = if (!is.null(sp$Saltwater)) as.integer(sp$Saltwater) else NA,
          DemersPelag = if (!is.null(sp$DemersPelag) && !is.na(sp$DemersPelag)) as.character(sp$DemersPelag) else NA,
          DepthRangeShallow = if (!is.null(sp$DepthRangeShallow)) as.numeric(sp$DepthRangeShallow) else NA,
          DepthRangeDeep = if (!is.null(sp$DepthRangeDeep)) as.numeric(sp$DepthRangeDeep) else NA,
          Length = if (!is.null(sp$Length)) as.numeric(sp$Length) else NA,
          Comments = if (!is.null(sp$Comments) && !is.na(sp$Comments)) as.character(sp$Comments) else NA,
          ImageURL = if (!is.null(sp$PicPreferredName) && !is.na(sp$PicPreferredName) && sp$PicPreferredName != "") {
            paste0("https://www.fishbase.se/images/species/", as.character(sp$PicPreferredName))
          } else {
            NA
          }
        ))
      }
    }
    
    list(error = "Espèce non trouvée")
    
  }, error = function(e) {
    list(error = conditionMessage(e))
  })
  
  return(res)
}
