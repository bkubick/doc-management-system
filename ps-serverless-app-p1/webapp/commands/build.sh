if [[ $1 == "--dev" ]]; then
    export NODE_OPTIONS=--openssl-legacy-provider
fi

react-scripts build
