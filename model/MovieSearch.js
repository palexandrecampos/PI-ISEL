'use strict'

function MovieSearch(results, name, page, totalPages, totalResults){
    this.results = results
    this.name = name
    this.actualPage = page
    this.totalPages = totalPages
    this.totalResults = totalResults
}

module.exports = MovieSearch