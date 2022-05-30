import React from "react";
import { useEffect } from "react";
import { BehaviorSubject, catchError, from, interval, map, of, Subscription, switchMap, tap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import './Dictionary.css';

export function Dictionary() {

    const word$ = React.useRef(new BehaviorSubject(''));

    function onValueChange(event: React.FormEvent<HTMLInputElement>) {
        console.log('value change')
        word$.current.next(event.currentTarget.value);        
    }

    useEffect(() => {

        const dictionarySearch$ = word$.current.pipe(
            switchMap(word => fromFetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`))
        );

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
            })
        );

        const foo = searchResult$.subscribe(x => console.log(x));
        const bar = word$.current.subscribe(x => console.log(x));

        // Subscribe to the observable and update state for each emitted value.
        const subscription = new Subscription();
        subscription.add(foo);
        subscription.add(bar);

        // Unregister subscription to avoid memory leaks.
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <h1>Dictionary search</h1>
            <form className="dictionary-form">
                <label htmlFor="input">Search word</label>
                <input id="input" type="text" onChange={onValueChange} />
            </form>
            <h2>Here is your result</h2>
            <div className="dictionary-result">
                <h3>Meanings</h3>
                <table>
                    <tr>
                        <th>Part of speech</th>
                        <th>Definition</th>
                        <th>Synonym</th>
                    </tr>
                    <tr>
                        <td>Foo</td>
                        <td>Bar</td>
                        <td>Xyz</td>
                    </tr>
                </table>
                <h3>Pronounciation</h3>
                <audio controls>
                    <source src="https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3" type="audio/mp3" />
                </audio>
            </div>
        </>
    )
}
