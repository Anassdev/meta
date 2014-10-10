class PostsController < ProductController
  respond_to :html

  def index
    find_product!
    @post = @product.posts.order(created_at: :desc).first

    if @post
      redirect_to product_post_path(@post.product, @post)
    end
  end

  def new
    find_product!
    authenticate_user!
    @post = @product.posts.new(author: current_user)
    authorize! :create, @post
  end

  def create
    find_product!
    authenticate_user!

    @post = @product.posts.new(post_params)
    @post.author = current_user

    authorize! :create, @post

    if @post.save
      @product.subscribers.each do |subscriber|
        PostMailer.delay(queue: 'mailer').mailing_list(@post.id, subscriber.email)
      end

      @product.watchers.each do |watcher|
        PostMailer.delay(queue: 'mailer').created(@post.id, watcher.id)
      end

      Activities::Post.publish!(
        actor: @post.author,
        subject: @post,
        target: @product,
        socket_id: params[:socket_id]
      )
    end

    respond_with @post, location: product_post_path(@post.product, @post)
  end

  def preview
    find_product!
    authenticate_user!
    authorize! :create, Post

    PostMailer.delay(queue: 'mailer').preview(@product.id, post_params.to_hash, current_user.id)

    render nothing: true
  end

  def show
    find_product!
    find_post!
  end

  def edit
    find_product!
    authenticate_user!
    find_post!
    authorize! :update, @post
  end

  def update
    find_product!
    authenticate_user!
    find_post!
    authorize! :update, @post

    @post.update_attributes(post_params)

    respond_with @post, location: product_post_path(@post.product, @post)
  end

private

  def find_post!
    if (params[:id] || '').uuid?
      @post = Post.find(params[:id])
    else
      @post = @product.posts.find_by_slug!(params[:id])
    end
  end

  def upgrade_stylesheet?
    true
  end

  def post_params
    params.require(:post).permit(:title, :summary, :body, :published_at, :flagged_at)
  end

end
