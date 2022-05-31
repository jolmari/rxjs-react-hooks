import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { BehaviorSubject, catchError, debounceTime, distinctUntilChanged, filter, of, share, Subscription, switchMap, tap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import './Dictionary.css';

interface Result {
    word: string;
    audioSrc: string;
}

export function Dictionary() {

    const [valid, setValid] = useState(true);
    const [result, setResult] = useState<Result | undefined>();

    // Search word stream
    const word$ = React.useRef(new BehaviorSubject(''));

    function onValueChange(event: React.FormEvent<HTMLInputElement>) {

        // Push new search value to stream
        word$.current.next(event.currentTarget.value);
    }

    useEffect(() => {

        // - When the search value stream emits, forward that value to an API call.
        // - filter()               => Filter out input with no characters.
        // - debounceTime()         => Debounce the stream by 750ms (allow time between keypresses).
        // - distinctUntilChanged() => Allow only values that have actually changed since last emission.
        // - switchMap()            => Returns a new Response-observable stream replacing the original.
        // - fromFetch()            => Perform a HTTP fetch, returning an observable.
        const dictionarySearch$ = word$.current.pipe(
            filter(word => word.length > 1),
            debounceTime(750),
            distinctUntilChanged(),
            switchMap(word =>
                fromFetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`))
        );

        // - When the search stream emits a response, create a new error / json observable.
        // - If the observable itself emits an error, process that with the catchError-operator.
        // - Share the observable with multiple subscribers, avoid repeated API-calls.
        const searchResult$ = dictionarySearch$.pipe(
            switchMap(response => {
                if (response.ok) {

                    // 200 OK
                    return response.json();
                }

                // Server returned some error code.
                return of({ error: true, message: `Error ${response.status}` });
            }),
            catchError(error => {

                // Other errors, network related etc. 
                return of({ error: true, message: error.message });
            }),
            share(),
        );

        // - Subscribe to the shared API response stream
        // - Filter only invalid responses
        // - Set form as invalid if there are errors
        const errorSubscription = searchResult$.pipe(
            filter(result => Boolean(result.error))
        ).subscribe(invalidResult => {
            setValid(false);
            setResult(undefined);
        });

        // - Subscribe to the shared API response stream
        // - Filter only valid responses
        // - Deserialize response, update state
        const resultSubscription = searchResult$.pipe(
            filter(result => !Boolean(result.error)),
            tap(result => console.info("Got a valid result", result)),
            switchMap(validResponse => {
                const firstResult = validResponse[0];
                const firstAudio = firstResult.phonetics.find((p: any) => Boolean(p.audio));
                return of({
                    word: firstResult.word,
                    audioSrc: firstAudio?.audio,
                })
            }),
        ).subscribe(result => {
            setValid(true);
            setResult({
                word: result.word,
                audioSrc: result.audioSrc
            });
        });

        // Subscribe to the observable and update state for each emitted value.
        const subscription = new Subscription();
        subscription.add(errorSubscription);
        subscription.add(resultSubscription);

        // Unregister subscription to avoid memory leaks.
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <h1>Dictionary search</h1>
            <form className={`dictionary-form ${valid ? 'is-valid' : 'is-invalid'}`}>
                <label htmlFor="input">Search word</label>
                <input id="input" type="text" onChange={onValueChange} />
            </form>
            {result &&
                (<div className="result-container">
                    <h2>Here is your result</h2>
                    <div className="dictionary-result">
                        <h3>Word</h3>
                        <p>{result.word}</p>
                        <h3>Pronounciation</h3>
                        <Audio src={result.audioSrc} />
                    </div>
                </div>)
            }
        </>
    )
}

function Audio({ src }: { src: string }) {

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef?.current) {
            audioRef.current.load();
        }
    }, [src])

    return (<audio ref={audioRef} controls>
        <source src={src} type="audio/mp3" />
    </audio>);
}
