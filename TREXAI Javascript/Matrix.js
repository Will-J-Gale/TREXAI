class Matrix
{
    constructor(rows, cols)
    {
        this.rows = rows;
        this.cols = cols;

        this.data = [];

        for (let i = 0; i < this.rows; i++)
        {
            this.data[i] = [];

            for(let j = 0; j < this.cols; j++)
            {
                this.data[i][j] = 0
            }
        }
    }
    static multiply(a, b)
    {
        //Matrix Product OR Dot product
        if(a.cols !== b.rows)
        {
            console.warn("Cols of A must match rows of B")
            return undefined
        }

        let result = new Matrix(a.rows, b.cols)
        //First 2 loops are using RESULT matrix
        //First loops over rows 
        for(let row = 0; row < result.rows; row++)
        { 
            for (let col = 0; col < result.cols; col++)
            {
                let sum = 0;

                for(let k = 0; k < a.cols; k++)
                {
                    sum += a.data[row][k] * b.data[k][col]
                }
                result.data[row][col] = sum;
            }
        }
        return result;
    }
    static subtract(a, b)
    {
        let result = new Matrix(a.rows, a.cols);

        for(let i = 0; i < result.rows; i++)
        {
            for(let j = 0; j < result.cols; j++)
            {
                result.data[i][j] = a.data[i][j] - b.data[i][j];
            }
        }

        return result;
    }
    static transpose(m)
    {
        let result = new Matrix(m.cols, m.rows)

        for(let i = 0; i < m.rows; i++)
        {
            for(let j = 0; j < m.cols; j++)
            {
                result.data[j][i] = m.data[i][j]
            }
        }

        return result
    }
    static fromArray(arr)
    {
        let m = new Matrix(arr.length, 1);
        for(let i = 0; i < arr.length; i++)
        {
            m.data[i][0] = arr[i];
        }
        return m;
    }
    toArray()
    {
        let arr = []
        for(let i = 0; i < this.rows; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                arr.push(this.data[i][j]);
            }
        }

        return arr;
    }
    randomize()
    {
        for(let i = 0; i < this.rows; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                this.data[i][j] = Math.random() * 2 - 1; 
            }
        }
    }
    
    print()
    {
        console.table(this.data);
    }
    multiply(n)
    {
        if (n instanceof Matrix)
        {
            for(let i = 0; i < this.rows; i++)
            {
                for(let j = 0; j < this.cols; j++)
                {
                    this.data[i][j] *= n.data[i][j];
                }
            }
        }
        else
        {
            for(let i = 0; i < this.rows; i++)
            {
                for(let j = 0; j < this.cols; j++)
                {
                    this.data[i][j] *= n;
                }
            }
        }
    } 
    add(n)
    {
        if (n instanceof Matrix)
        {
            for(let i = 0; i < this.rows; i++)
            {
                for(let j = 0; j < this.cols; j++)
                {
                    this.data[i][j] += n.data[i][j];
                }
            }
        }
        else
        {
            for(let i = 0; i < this.rows; i++)
            {
                for(let j = 0; j < this.cols; j++)
                {
                    this.data[i][j] += n;
                }
            }
        }
    }
    map(fn)
    {
        //Apply function to every element in matrix
        for(let i = 0; i < this.rows; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                let val = this.data[i][j];
                this.data[i][j] = fn(val);
            }
        }
    } 
    static map(m, fn)
    {
        let result = new Matrix(m.rows, m.cols)
        //Apply function to every element in matrix
        for(let i = 0; i < m.rows; i++)
        {
            for(let j = 0; j < m.cols; j++)
            {
                let val = m.data[i][j];
                result.data[i][j] = fn(val);
            }
        }

        return result;
    } 
    copy()
    {
        let m = new Matrix(this.rows, this.cols);

        for(let i = 0; i < this.rows; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                m.data[i][j] = this.data[i][j];
            }
        }

        return m;
    }
}

/*
    (dot product)    

    A
    [a b c]
    [d e f]

    B
    [g h]
    [i j]
    [k l]

    Result = A Rows x B Cols (2, 2)

    [1 2]
    [3 4]
    

    1 = (a * g) + (b * i) + (c * k)
    2 = (a * h) + (b * j) + (c * l)
    3 = (d * g) + (e * i) + (f * k)
    4 = (d * h) + (e * j) + (f * l)

*/