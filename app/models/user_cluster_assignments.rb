class UserClusterAssignments

  def generate_random_clusters(n)
    clusters = []
    (1..n).each do
      a=UserCluster.new
      clusters.append(a)
    end

    q=0
    User.all.each do |u|
      puts q
      r= q%n
      user_vector = u.user_identity.get_mark_vector
      if user_vector.count>0
        clusters[r].add_user_id(u.id, user_vector)
      end
      q=q+1
    end
  clusters
  end

  def assign_user_to_cluster(user, current_cluster, all_clusters)
    user_vector = user.user_identity.get_mark_vector
    distances = []
    best_distance = 999999999
    best_cluster = 0
    q=0
    all_clusters.each do |c|
      d=QueryMarks.new.vector_square_distance(user_vector, c.average_vector)
      puts d
      if d<best_distance
        best_cluster=q
        best_distance=d
      end
      q=q+1
    end
    newcluster = all_clusters[best_cluster]
    if newcluster != current_cluster
      #if current_cluster
      puts "removing user from cluster "
      current_cluster.remove_user_id(user.id, user_vector)
      #end
      newcluster.add_user_id(user.id, user_vector)
    end
    newcluster
  end

  def resort_users_in_clusters(clusters)
    clusters.each do |cluster|
      cluster.users.each do |user|
        assign_user_to_cluster(User.find(user), cluster, clusters)
        puts user
        puts clusters.sum{|a| a.users.count}
      end
    end
  end

  def cluster_average(clusters)
    cluster_vector = []
    users = 0
    clusters.each do |cluster|
      cluster_vector = QueryMarks.new.add_mark_vectors(cluster_vector, QueryMarks.new.scale_mark_vector(cluster.average_vector, cluster.users.count))
      users = users+cluster.users.count
    end
    s = Math.sqrt(cluster_vector.sum{|b| b[1]**2})
    cluster_vector = QueryMarks.new.scale_mark_vector(cluster_vector, 1.0/s)
  end

  def distinguish_clusters(clusters)
    average = cluster_average(clusters)
    d=[]
    clusters.each do |cluster|
      cv=cluster.average_vector
      s=Math.sqrt(cv.sum{|g| g[1]**2})
      cluster_vector = cv.map{|a| [a[0], a[1]/s]}
      difference = QueryMarks.new.add_mark_vectors(average, QueryMarks.new.scale_mark_vector(cluster_vector, -1.0))
      difference = difference.sort_by{|h| h[1]}.reverse.take(10)
      d.append(QueryMarks.new.legible_mark_vector(difference))
    end
    d
  end

  def cluster_frack
    clusters = [UserCluster.new, UserCluster.new, UserCluster.new]
    u1=User.find_by(username: "mdeiters")
    clusters.first.add_user_id(u1, u1.user_identity.get_mark_vector)

    u2=User.find_by(username: "barisser")
    clusters.second.add_user_id(u2, u2.user_identity.get_mark_vector)

    u3=User.find_by(username: "bshyong")
    clusters.third.add_user_id(u3, u3.user_identity.get_mark_vector)

    q=0
    User.all.take(500).each do |u|
      puts q
      assign_user_to_cluster(u, nil, clusters)
      q=q+1
    end
    clusters
  end

end
