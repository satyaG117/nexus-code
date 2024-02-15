import { useCallback, useEffect, useRef } from "react"

const useFetch = () => {
    const activeRequests = useRef([]);

    const makeRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        if (body != null) {
            body = JSON.stringify(body);

        }
        // create a abort controller for the request
        const httpAbortCtrl = new AbortController();
        // push the controller for the current request
        activeRequests.current.push(httpAbortCtrl);
        try {
            const response = await fetch(url, {
                method, body, headers, signal: httpAbortCtrl.signal
            })

            const responseData = await response.json();

            // remove the controller after the request is done
            activeRequests.current = activeRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl)

            // manually catch and throw error
            if (!response.ok) {
                throw new Error(responseData.message);
            }

            return responseData
        } catch (err) {
            throw new Error(err.message);
        }
    }, [])

    useEffect(() => {
        return () => {
            // abort all requests on dismount
            activeRequests.current.forEach(reqCtrl => reqCtrl.abort())
        }
    }, [])

    return makeRequest;
}

export default useFetch;