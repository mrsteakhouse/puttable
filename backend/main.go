package main

import (
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
	"strconv"
	"time"
)

type Tournament struct {
	Id                           int    `json:"id"`
	Name                         string `json:"name"`
	StartDateTime                int64  `json:"startDateTime"`
	EndDateTime                  int64  `json:"endDateTime"`
	NumberOfHoles                int    `json:"numberOfHoles"`
	MinimumCompetitorsPerSession int    `json:"minimumCompetitorsPerSession"`
	Description                  string `json:"description"`
}

func main() {
	tournaments := []Tournament{
		{
			Id:                           1,
			Name:                         "First Tournament",
			StartDateTime:                234234234234,
			EndDateTime:                  2342134234234,
			NumberOfHoles:                18,
			MinimumCompetitorsPerSession: 1,
			Description:                  "Some Test dEscrption",
		},
		{
			Id:                           2,
			Name:                         "Another Tournament",
			StartDateTime:                123123123,
			EndDateTime:                  123123123,
			NumberOfHoles:                18,
			MinimumCompetitorsPerSession: 3,
			Description:                  "asdasdasd",
		},
	}

	root := chi.NewRouter()
	root.Use(middleware.RequestID)
	root.Use(middleware.RealIP)
	root.Use(middleware.Logger)
	root.Use(middleware.Recoverer)

	root.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	root.Use(middleware.Timeout(60 * time.Second))

	root.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("Hello World"))
		if err != nil {
			return
		}
	})

	root.Get("/api/v1/tournament", func(w http.ResponseWriter, r *http.Request) {
		data, _ := json.Marshal(tournaments)
		_, _ = w.Write(data)
	})

	root.Get("/api/v1/tournament/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := getIdFromUrl(r, "id")
		for _, tournament := range tournaments {
			if tournament.Id == id {
				data, _ := json.Marshal(tournament)
				_, _ = w.Write(data)
			}
		}

		w.WriteHeader(http.StatusNotFound)
	})

	err := http.ListenAndServe(":8000", root)
	if err != nil {
		panic(err)
	}
}

func getIdFromUrl(r *http.Request, key string) int {
	id, err := strconv.Atoi(chi.URLParam(r, key))
	if err != nil {
		print(err.Error())
		return -1
	}

	return id
}
