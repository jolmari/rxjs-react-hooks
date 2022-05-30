import { useState, useEffect } from "react";
import { interval, map } from "rxjs";

export function NumberGenerator() {

    const [result, setResult] = useState({
        original: 0,
        square: 0,
        cube: 0,
    });

    useEffect(() => {
        
        // Create a new observable from an array of numbers.
        // 1. Interval(1000) emits an incrementing number per 1000ms
        // 2. Map() increments the value by 1, since we don't want to process zero
        const numbers$ = interval(1000).pipe(
            map(val => val + 1)
        );

        // Subscribe to the observable and update state for each emitted value.
        const subscription = numbers$
            .subscribe(val => setResult({
                original: val,
                square: val * val,
                cube: val * val * val,
            }));

        // Unregister subscription to avoid memory leaks.
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <h2>Reactive numbers</h2>
            <p>The current number is: {result.original}</p>
            <p>The current number squared is: {result.square}</p>
            <p>The current number cubed is: {result.cube}</p>
            {result.original > 10 && result.original < 50 && <p><b>Over 10!</b></p>}
            {result.original > 50 && <p><b>Over 50!</b></p>}
        </>
    )
}