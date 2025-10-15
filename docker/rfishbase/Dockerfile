## Utiliser l'image 'rocker' précompilée (contient les outils R et facilite l'installation de paquets)
FROM rocker/r-ver:4.3.2

ENV DEBIAN_FRONTEND=noninteractive

# Installer dépendances système nécessaires pour compiler certains paquets R (arrow, libcurl...)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake pkg-config \
    libcurl4-openssl-dev libssl-dev libxml2-dev libgit2-dev \
    zlib1g-dev libbz2-dev liblz4-dev libsnappy-dev libzstd-dev libicu-dev \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Installer 'pak' (rapide) puis configurer RSPM pour privilégier les binaires précompilés
RUN Rscript -e "install.packages('pak', repos = 'https://cran.rstudio.com')"
RUN Rscript -e "options(repos = c(CRAN = 'https://cran.rstudio.com', RSPM = 'https://packagemanager.rstudio.com/all/latest')); pak::pkg_install(c('plumber','jsonlite','rfishbase','arrow'), ask = FALSE)"

WORKDIR /app
COPY plumber.R /app/plumber.R

EXPOSE 8000

CMD ["R", "-e", "pr <- plumber::plumb('/app/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
